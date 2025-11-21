"use strict";

const libsignal = require("libsignal");
const { Utils } = require("../Utils");
const { WABinary } = require("../WABinary");
const { SenderKeyName } = require("./Group/sender-key-name");
const { SenderKeyRecord } = require("./Group/sender-key-record");
const { GroupCipher, GroupSessionBuilder, SenderKeyDistributionMessage } = require("./Group");

function createLibSignalRepository(authContext) {
    const storage = initializeSignalStorage(authContext);
    
    const protocolAddressFromJid = (jid) => {
        const { user, device } = WABinary.jidDecode(jid);
        return new libsignal.ProtocolAddress(user, device || 0);
    };

    const senderKeyNameFromJid = (groupId, userId) => {
        return new SenderKeyName(groupId, protocolAddressFromJid(userId));
    };

    return {
        decryptGroupMessage({ groupId, authorJid, encryptedData }) {
            const senderKeyIdentifier = senderKeyNameFromJid(groupId, authorJid);
            const groupDecryptor = new GroupCipher(storage, senderKeyIdentifier);
            return groupDecryptor.decrypt(encryptedData);
        },

        async handleSenderKeyDistribution({ distributionMessage, groupId, authorJid }) {
            const sessionBuilder = new GroupSessionBuilder(storage);
            
            if (!groupId) {
                throw new Error('Group identifier is required for processing sender key distribution');
            }

            const senderKeyIdentifier = senderKeyNameFromJid(groupId, authorJid);
            const distributionMsg = new SenderKeyDistributionMessage(
                null, null, null, null, 
                distributionMessage.axolotlSenderKeyDistributionMessage
            );

            const senderKeyId = senderKeyIdentifier.toString();
            const existingKeys = await authContext.keys.get('sender-key', [senderKeyId]);
            
            if (!existingKeys[senderKeyId]) {
                await storage.storeSenderKey(senderKeyIdentifier, new SenderKeyRecord());
            }

            await sessionBuilder.process(senderKeyIdentifier, distributionMsg);
        },

        async decryptIndividualMessage({ jid, messageType, encryptedContent }) {
            const address = protocolAddressFromJid(jid);
            const messageDecryptor = new libsignal.SessionCipher(storage, address);
            
            let decryptionResult;
            switch (messageType) {
                case 'pkmsg':
                    decryptionResult = await messageDecryptor.decryptPreKeyWhisperMessage(encryptedContent);
                    break;
                case 'msg':
                    decryptionResult = await messageDecryptor.decryptWhisperMessage(encryptedContent);
                    break;
                default:
                    throw new Error(`Unsupported message format: ${messageType}`);
            }
            
            return decryptionResult;
        },

        async encryptIndividualMessage({ jid, plaintext }) {
            const address = protocolAddressFromJid(jid);
            const messageEncryptor = new libsignal.SessionCipher(storage, address);
            
            const { type: signalType, body: encryptedBody } = await messageEncryptor.encrypt(plaintext);
            const messageType = signalType === 3 ? 'pkmsg' : 'msg';
            
            return { 
                type: messageType, 
                ciphertext: Buffer.from(encryptedBody, 'binary') 
            };
        },

        async encryptGroupMessage({ groupId, selfJid, messageData }) {
            const senderKeyIdentifier = senderKeyNameFromJid(groupId, selfJid);
            const sessionBuilder = new GroupSessionBuilder(storage);
            
            const senderKeyId = senderKeyIdentifier.toString();
            const existingKeys = await authContext.keys.get('sender-key', [senderKeyId]);
            
            if (!existingKeys[senderKeyId]) {
                await storage.storeSenderKey(senderKeyIdentifier, new SenderKeyRecord());
            }

            const distributionMessage = await sessionBuilder.create(senderKeyIdentifier);
            const groupEncryptor = new GroupCipher(storage, senderKeyIdentifier);
            const encryptedContent = await groupEncryptor.encrypt(messageData);
            
            return {
                ciphertext: encryptedContent,
                senderKeyDistributionMessage: distributionMessage.serialize()
            };
        },

        async initializeE2ESession({ jid, sessionData }) {
            const sessionInitializer = new libsignal.SessionBuilder(
                storage, 
                protocolAddressFromJid(jid)
            );
            await sessionInitializer.initOutgoing(sessionData);
        },

        convertJidToSignalAddress(jid) {
            return protocolAddressFromJid(jid).toString();
        }
    };
}

function initializeSignalStorage({ creds, keys }) {
    return {
        async loadSession(sessionId) {
            const sessions = await keys.get('session', [sessionId]);
            if (sessions[sessionId]) {
                return libsignal.SessionRecord.deserialize(sessions[sessionId]);
            }
            return null;
        },

        async storeSession(sessionId, sessionRecord) {
            await keys.set({ 
                session: { 
                    [sessionId]: sessionRecord.serialize() 
                } 
            });
        },

        isTrustedIdentity: () => true,

        async loadPreKey(keyId) {
            const keyIdentifier = keyId.toString();
            const preKeys = await keys.get('pre-key', [keyIdentifier]);
            
            if (preKeys[keyIdentifier]) {
                return {
                    privKey: Buffer.from(preKeys[keyIdentifier].private),
                    pubKey: Buffer.from(preKeys[keyIdentifier].public)
                };
            }
            return null;
        },

        async removePreKey(keyId) {
            await keys.set({ 
                'pre-key': { 
                    [keyId]: null 
                } 
            });
        },

        loadSignedPreKey() {
            const signedKey = creds.signedPreKey;
            return {
                privKey: Buffer.from(signedKey.keyPair.private),
                pubKey: Buffer.from(signedKey.keyPair.public)
            };
        },

        async loadSenderKey(senderKeyIdentifier) {
            const keyId = senderKeyIdentifier.toString();
            const senderKeys = await keys.get('sender-key', [keyId]);
            
            if (senderKeys[keyId]) {
                return SenderKeyRecord.deserialize(senderKeys[keyId]);
            }
            return new SenderKeyRecord();
        },

        async storeSenderKey(senderKeyIdentifier, keyRecord) {
            const keyId = senderKeyIdentifier.toString();
            const serializedData = JSON.stringify(keyRecord.serialize());
            
            await keys.set({ 
                'sender-key': { 
                    [keyId]: Buffer.from(serializedData, 'utf-8') 
                } 
            });
        },

        getOurRegistrationId: () => creds.registrationId,

        getOurIdentity() {
            const { signedIdentityKey } = creds;
            return {
                privKey: Buffer.from(signedIdentityKey.private),
                pubKey: Utils.generateSignalPubKey(signedIdentityKey.public)
            };
        }
    };
}

module.exports = { 
    makeLibSignalRepository: createLibSignalRepository 
};