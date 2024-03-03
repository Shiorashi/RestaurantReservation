const mongoose = require('mongoose');

const RestaurantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        unique: true,
        trim: true,
        maxlength: [50, 'Name can not be more than 50 characters']
    },
    address: {
        type: String,
        required: [true, 'Please add an address']
    },

    district:{
        type: String,
        required: [true, 'Please add a district']
    },
    province: {
        type: String,
        required: [true, 'Please add a province']
    },
    postalcode:{
        type: String,
        required: [true,'Please add a postalcode']
    },
    tel:{
        type: String
    },
    openclosetime:{
        type: String,
        required: [true,'Please add an opening and closing time']
    }
},{
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
});



RestaurantSchema.virtual('reservations',{
    ref:'Reservation',
    localField:'_id',
    foreignField:'restaurant',
    justOne: false
});

RestaurantSchema.pre('deleteOne',{document:true,query:false},async function(next){
    console.log(`Reservations being removed from restaurant ${this._id}`);
    await this.model('Reservation').deleteMany({restaurant:this._id});
    next();
})



module.exports=mongoose.model('Restaurant', RestaurantSchema);
