const MainAd = require('../models/other/MainAd');
const HomeAd = require('../models/other/HomeAd');
const BannerAd = require('../models/other/BannerAd');
const DealsOfTheDay = require('../models/other/DealOfTheDay');
const Store = require('../models/seller/Store');
const Product = require('../models/seller/product/Product');
const FeaturedProduct = require('../models/other/FeaturedProduct');
const { getVariables } = require('../variables');

const cron = require('node-cron');

cron.schedule('59 23 * * *', () => {
    const date = new Date();
    // BannerAd.remove({});
    BannerAd
        .find({
            lastRenew: {
                $gte: new Date(date.getFullYear(), date.getMonth(), date.getDate() - 8),
                $lte: new Date(date.getFullYear(), date.getMonth(), date.getDate() - 7) 
            } 
        })
        .populate({path: 'store', select: 'credit'})
    .then(ads => {
        const promises = [];
            ads.forEach(ad => {
                if(ad.renew && ad.store.credit >= 20){
                    promises.push(BannerAd.findOneAndUpdate({_id: ad._id}, {lastRenew: new Date()}).exec());
                    promises.push(Store.updateOne({_id: ad.store._id}, {$inc: {credit: -20}}).exec());
                } else {
                    promises.push(BannerAd.deleteOne(ad).exec());
                }
            }, [])
        Promise.all(promises).then(res => console.log('Updated Banner')).catch(err => console.log(err));
    })
    
    //! Delete active Deals of the Day and activate the new ones
    DealsOfTheDay.deleteMany({active: true}).then(resp => DealsOfTheDay.updateMany({active: false}, {active: true}))
});

cron.schedule('59 23 * * Saturday', () => {
    HomeAd.deleteMany({active: true})
    .then(res => {
        HomeAd.updateMany({active: false}, {active: true});
    })
})

/* -------------------------------------------------------------------------- */
/*                                  Main Ads                                  */
/* -------------------------------------------------------------------------- */

exports.createMainAd = (req, res, next) => {
    // Ad Types
    //   0 - Product
    //   1 - Store
    const mainAd = {
        image: req.body.image,
        type: req.body.type,
        destination: req.body.destination
    }
    MainAd.create(mainAd)
    .then(resp => resp.toJSON())
    .then(resp => {
        res.json(resp)
    })
    .catch(err => next(err));
}

exports.getMainAds = (req, res, next) => {
    BannerAd
        .find()
        .then(resp => res.json(shuffle(resp)))
        .catch(err => next(err));
}

/* -------------------------------------------------------------------------- */
/*                                  Home Ads                                  */
/* -------------------------------------------------------------------------- */

exports.createHomeAd = (req, res, next) => {
    HomeAd.create(req.body)
    .then(resp => resp.toJSON())
    .then(resp => res.json(resp))
    .catch(err => next(err));
}

exports.getHomeAds = (req, res, next) => {
    HomeAd.find({active: true})
    .then(resp => res.json(resp))
    .catch(err => next(err));
}

exports.getCurrentHomeAd = (req, res, next) => {
    HomeAd.find({page: req.params.page})
    .populate({
        path: 'store',
        select: 'title logo'
    })
    .then(resp => {
        const current = resp.filter(ad => ad.active)[0];
        const highestBid = resp.filter(ad => !ad.active)[0];
        
        res.json({current, highestBid})
    })
    .catch(err => next(err));
}

exports.getHighestBidder = (req, res, next) => {
    HomeAd.findOne({active: false, page: req.params.page})
    .then(resp => res.json(resp))
    .catch(err => next(err));
}

exports.updateHighestBidder = (req, res, next) => {
    const newAd = req.body;
    newAd.store = newAd.store._id;
    delete newAd.seller;
    HomeAd.findOne({active: false, page: req.body.page})
    .then(currAd => {
        if(!currAd){
            HomeAd.create(req.body)
            .then(resp => resp.toJSON())
            .then(resp => {
                Store.findOneAndUpdate({_id: newAd.store}, {$inc: {credit: newAd.bid * -1}})
                .then(() => res.json(resp));
            })
            .catch(err => next(err));
        }
        else if(newAd.bid >= currAd.bid + getVariables().homeAd){
            Store.findOneAndUpdate({_id: currAd.store}, {$inc: {credit: currAd.bid}}, {new: true})
            .then(resp => console.log(`Updated old credit (${resp.title})`, resp.credit));
            Store.findOneAndUpdate({_id: newAd.store}, {$inc: {credit: newAd.bid * -1}})
            .then(resp => console.log(`Updated new credit (${resp.title})`, resp.credit));
            HomeAd.findOneAndUpdate({active: false, page: req.body.page}, req.body, {new: true})
            .populate({
                path: 'store',
                select: 'title logo'
            })
            .then(resp => res.json(resp))
            .catch(err => next(err));
        } else {
            next({status: 400, message: `Your ad doesn't have a high enough bid`});
        }
    })
}

exports.alternateActiveBid = (req, res, next) => {
    HomeAd.findOneAndDelete({active: true, page: req.body.page})
    .then(() => {
        HomeAd.findOneAndUpdate({active: false}, {active: true}, {new: true})
        .then(resp => res.json(resp))
        .catch(err => next(err));
    })
}

/* -------------------------------------------------------------------------- */
/*                                 BANNER ADS                                 */
/* -------------------------------------------------------------------------- */

// ! Banner Ad Cost 20 EGP 

exports.getOwnBanners = (req, res, next) => {
    const store = req.body.store;
    BannerAd.find({store: store._id})
    .then(resp => res.json(resp))
    .catch(err => next(err))
}

exports.createBannerAd = (req, res, next) => {
    const store = req.body.store;
    Store.findOneAndUpdate({_id: store._id, credit: {$gte: getVariables().bannerAd}}, {$inc: {credit: -1 * getVariables().bannerAd}}, {new: true})
    .then(resp => {
                if(!resp)
                    next({status: 400, message: "You do not have enough store credits"})
                else {
                    BannerAd.create({
                        adType: req.body.adType,
                        image: req.body.image,
                        store: store._id,
                        product: req.body.product,
                        lastRenew: new Date()
                    })
                    .then(resp => resp.toJSON())
                    .then(() => res.json({success: true}))
                }
        }
    )
}

/**
 * *{
 * *    bannerAd: {
 * *        _id: Banner Ad ID,
 * *        ...changes
 * *    }
 * *}
 */
exports.updateBannerAd = (req, res, next) => {
    const store = req.body.store;
    const bannerAd = req.body.bannerAd;

    console.log('updating banner ad', bannerAd)
    BannerAd.findOneAndUpdate({_id: bannerAd._id, store: store._id}, bannerAd, {new: true})
    .then(resp => {
        console.log(resp);
        res.json(resp)
    })
    .catch(err => next(err));
}

/* -------------------------------------------------------------------------- */
/*                               Deal Of The Day                              */
/* -------------------------------------------------------------------------- */

exports.getDealsOfTheDay = (req, res, next) => {
    DealsOfTheDay.find({active: true})
    .sort({discount: -1})
    .populate({path: 'product', match :{isDeleted :false},select: 'title images price'})
    .populate({path: 'store', select: 'title'})
    .then(resp => res.json(resp))
    .catch(err => next(err));
}

exports.getFullDealsOfTheDay = (req, res, next) => {
    DealsOfTheDay.find({active: true})
    .sort({discount: -1})
    .populate({path: 'product', match :{isDeleted :false}, populate: 'dealOfTheDay store'})
    .populate({path: 'store', select: 'title'})
    .then(resp => res.json(resp))
    .catch(err => next(err));
}

exports.getOwnDealsOfTheDay = (req, res, next) => {
    const store = req.body.store;
    DealsOfTheDay.find({store: store._id})
    .populate({path : 'product', match :{isDeleted :false}})
    .then(resp => res.json(resp))
    .catch(err => next(err));
}

exports.createDealOfTheDay = (req, res, next) => {
    const store = req.body.store;
    DealsOfTheDay.findOne({product: req.body.product})
    .then(resp => {
        if(resp)
            return next({status: 403, message: 'Product Already Exists'})
        else {
            Store.findOne({_id: store._id})
            .then(resp => {
                if(resp.credit >= getVariables().dealOfTheDay){
                    Store.findOneAndUpdate({_id: store._id}, {$inc: {credit: -1 * getVariables().dealOfTheDay}}, {new: true})
                    .then(resp => {
                        if(!resp)
                            next({status: 404, message: `Couldn't find store`});
                        else {
                            DealsOfTheDay.create({
                                store: store._id,
                                product: req.body.product,
                                discount: req.body.discount
                            })
                            .then(resp => resp.toJSON())
                            .then(deal => {
                                Product.findOneAndUpdate({_id: req.body.product}, {dealOfTheDay: deal}, {new: true})
                                .then(resp => res.json(resp));
                            })
                        }
                    })
                    .catch(err => next(err));
                }
                else {
                    next({status: 400, message: "You do not have enough store credits"})
                }
            })
        }
    })
}

/* -------------------------------------------------------------------------- */
/*                              Featured Products                             */
/* -------------------------------------------------------------------------- */

exports.getFeaturedProducts = (req, res, next) => {
    FeaturedProduct.find({})
    .populate({
        path: 'product',
        populate: 'store',
        match :{isDeleted :false}
    })
    .limit(5)
    .then(resp => res.json(resp));
}


/* -------------------------------------------------------------------------- */
/*                              Helper Functions                              */
/* -------------------------------------------------------------------------- */

function shuffle(array) {
    let currentIndex = array.length, temporaryValue, randomIndex;
  
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
  
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
  
      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
  
    return array;
  }