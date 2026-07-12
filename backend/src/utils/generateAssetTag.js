const Counter = require('../models/Counter');

const generateAssetTag = async () => {
    let counter;

    try {
        counter = await Counter.findOneAndUpdate(
            { _id: 'assetTag' },
            { $inc: { sequence: 1 } },
            { new: true, upsert: true }
        );
    } catch (error) {
        // Two first requests can race while creating the counter document. Once
        // one succeeds, retry the increment against the document it created.
        if (error.code !== 11000) throw error;

        counter = await Counter.findOneAndUpdate(
            { _id: 'assetTag' },
            { $inc: { sequence: 1 } },
            { new: true }
        );
    }

    return `AF-${String(counter.sequence).padStart(4, '0')}`;
};

module.exports = generateAssetTag;
