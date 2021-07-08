let contact = 
    {
        email: 'emall.eg.official@gmail.com',
        phone: '+201140008820',
        address: {
            city: {en: 'El Mokattam', ar: 'المقطم'},
            street: {en: 'Lorem Ipsum Street, Beside Kababgy Kaza', ar: ''},
            extra: {en: 'Building number 24, Second Floor, Apartment #210', ar: ''}
        }
    };

const getContact = () => contact;

const changeContact = newContact => contact = newContact;

module.exports = {getContact, changeContact};