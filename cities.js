let cities = [{
    title: {
        en: 'Cairo',
        ar: 'القاهرة'
    },
    price: 0
}];

const getCities = () => cities;

const changeCities = (newCities) => cities = newCities;

module.exports = {getCities, changeCities};