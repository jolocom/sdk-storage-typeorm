"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ramda_1 = require("ramda");
/**
 * Given an array of Credential Entities, will attempt to group them by
 * the credential they are part of, and return a sumarry, contain a key name
 * and an array of aggregated values
 *
 * TODO this function must be changed to use vanilla types, NOT entities
 * this is the only thing making the sdk dependant on local entity definitions
 *
 * @param credentials - Credential Entities to group. If all claims are part of different
 * credentials, the array is returned unmodified
 */
exports.groupAttributesByCredentialId = (credentials) => {
    /** @dev We get a number of credential entities. Each contains one claim. We first
     * group all entities part of the same credential together (i.e. given name, family name)
     */
    const groupedByCredential = Object.values(ramda_1.groupBy((credential) => credential.verifiableCredential.id, credentials));
    return groupedByCredential.map(credentials => (Object.assign(Object.assign({}, credentials[0]), { propertyValue: credentials.map(cred => cred.propertyValue) })));
};
exports.numberTransformer = {
    to: (entityValue) => entityValue,
    from: (databaseValue) => Number(databaseValue)
};
