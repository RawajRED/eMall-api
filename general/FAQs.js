let faqs = [
    {
        _id: 1,
        question: {en: 'Q: Is it possible to Lorem Ipsum?', ar: 'س: هل من الممكن؟'},
        answer: {en: 'A: It is highly likely that you can Lorem Ipsum', ar: 'ج: بالطبع عزيزي المستخدم!'}
        
    },
    {
        _id: 2,
        question: {en: 'Q: Is it possible to Lorem Ipsum?', ar: 'س: هل من الممكن؟' },
        answer: {en: 'A: It is highly likely that you can Lorem Ipsum', ar: 'ج: بج: الطبع عزيزي المستخدم!'}
        
    },
    {
        _id: 3,
        question: {en: 'Q: Is it possible to Lorem Ipsum?', ar: 'س: هل من الممكن؟'},
        answer: {en: 'A: It is highly likely that you can Lorem Ipsum', ar: 'ج: بالطبع عزيزي المستخدم!'}
        
    },
    {
        _id: 4,
        question: {en: 'Q: Is it possible to Lorem Ipsum?', ar: 'س: هل من الممكن؟'},
        answer: {en: 'A: It is highly likely that you can Lorem Ipsum', ar: 'ج: بالطبع عزيزي المستخدم!'}
        
    }
]

const getFAQs = () => faqs;

const changeFAQs = newFAQs => faqs = newFAQs;

module.exports = {getFAQs, changeFAQs};