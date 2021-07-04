let governates = [{
    title: {
        en: 'Cairo',
        ar: 'القاهرة'
    },
    price: 0
}];

const getGovernates = () => governates;

const changeGovernates = newGovernates => governates = newGovernates;

module.exports = {getGovernates, changeGovernates};