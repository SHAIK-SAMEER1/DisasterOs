// Audit Hash Chain — DisasterOS Phase 2B
// SHA-256 hash chaining for tamper-evident audit log entries.
// Uses Web Crypto API in browser or Node.js built-in crypto module.

class AuditHashChain {
    constructor() {
        this.genesisHash = '0000000000000000000000000000000000000000000000000000000000000000';
        this.chain = [];
        this._lastHash = this.genesisHash;
    }

    /**
     * Compute SHA-256 of a UTF-8 string.
     * Works in both browser (Web Crypto) and Node.js.
     */
    async _sha256(str) {
        const isNode = typeof module !== 'undefined' && module.exports;
        if (isNode) {
            const { createHash } = require('crypto');
            return createHash('sha256').update(str, 'utf8').digest('hex');
        } else {
            const encoder = new TextEncoder();
            const data = encoder.encode(str);
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        }
    }

    /**
     * Append a new audit entry to the chain.
     * @param {Object} entry  - { actor, action, resource, details }
     * @returns {Object}  The sealed block with block_hash
     */
    async append(entry) {
        const block = {
            block_index: this.chain.length,
            timestamp: new Date().toISOString(),
            actor: entry.actor || 'system',
            action: entry.action,
            resource: entry.resource || null,
            details: entry.details || null,
            previous_hash: this._lastHash
        };

        // Hash = SHA-256(previousHash + JSON.stringify(block without block_hash))
        const hashInput = block.previous_hash + JSON.stringify(block);
        block.block_hash = await this._sha256(hashInput);

        this._lastHash = block.block_hash;
        this.chain.push(block);
        return block;
    }

    /**
     * Verify the entire audit chain for tampering.
     * @returns {Object} { valid, failedAt, reason }
     */
    async verify() {
        let prevHash = this.genesisHash;

        for (let i = 0; i < this.chain.length; i++) {
            const block = this.chain[i];

            // Check previous_hash linkage
            if (block.previous_hash !== prevHash) {
                return {
                    valid: false,
                    failedAt: i,
                    reason: `Block ${i}: previous_hash mismatch. Chain broken between block ${i - 1} and ${i}.`
                };
            }

            // Re-compute hash to verify integrity
            const verifyBlock = { ...block };
            const storedHash = verifyBlock.block_hash;
            delete verifyBlock.block_hash;

            const hashInput = verifyBlock.previous_hash + JSON.stringify(verifyBlock);
            const recomputed = await this._sha256(hashInput);

            if (recomputed !== storedHash) {
                return {
                    valid: false,
                    failedAt: i,
                    reason: `Block ${i}: hash mismatch — data has been tampered with.`
                };
            }

            prevHash = storedHash;
        }

        return { valid: true, failedAt: null, reason: `All ${this.chain.length} blocks verified.` };
    }

    /**
     * Return chain summary for UI display.
     */
    getSummary() {
        return {
            total_entries: this.chain.length,
            genesis_hash: this.genesisHash,
            latest_hash: this._lastHash,
            entries: this.chain.slice(-20) // Return last 20 for display
        };
    }
}

// Export for Node testing; expose globally in browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AuditHashChain };
} else {
    window.auditChain = new AuditHashChain();
}
