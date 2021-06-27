let variables = {
    homeAd: 20,
    bannerAd: 20,
    dealOfTheDay: 20,
    shipping: 80
}

const getVariables = () => variables;

const changeVariables = (newVars) => variables = newVars;

module.exports = {getVariables, changeVariables};