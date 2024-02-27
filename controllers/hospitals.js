
const Hospital = require('../models/Hospital');

const vacCenter = require("../models/VacCenter")

exports.getVacCenters = (req,res,next)=>{
    vacCenter.getAll((err,data)=>{
        if(err)
          res.status(500).send({
            message:
               err.message || "Some error occured while retrieving the vaccine centers"
        });
        else res.send(data);
    });
};

//@desc Get all hospitals
//@route GET /api/v1/hospitals
//@access Public
exports.getHospitals=async(req,res,next)=>{
    let query;

    const reqQuery={...req.query};

    const removeFields=['select','sort','page','limit'];

    removeFields.forEach(param=>delete reqQuery[param]);
    console.log(reqQuery)



    let queryStr=JSON.stringify(reqQuery);
    queryStr=queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g,match=>`$${match}`);

    query =Hospital.find(JSON.parse(queryStr)).populate('appointments');

    if(req.query.select){
        const fields=req.query.select.split(',').join(' ');
        query=query.select(fields);
    }

    if(req.query.sort){
        const sortBy=req.query.sort.split(',').join(' ');
        query=query.sort(sortBy);
    }else{
        query.sort('-createdAt');
    }

    const page=parseInt(req.query.page,10)||1;
    const limit=parseInt(req.query.limit,10)||25;
    const startIndex=(page-1)*limit;
    const endIndex=page*limit;
    

    try{
        const total=await Hospital.countDocuments();
        query=query.skip(startIndex).limit(limit);

        const hospitals = await query

        const pagination={};

        if(endIndex<total){
            pagination.next={
                page:page+1,
                limit
            }
        }

        if(startIndex>0){
            pagination.prev={
                page:page-1,
                limit
            }
        }
        
        res.status(200).json({success:true,count: hospitals.length, data:hospitals});
    } catch(err){
        res.status(400).json({success:false});
    }
}

//@desc Get single hospitals
//@route GET /api/v1/hospitals/:id
//@access Public
exports.getHospital=async(req,res,next)=>{
    try{
        const hospital = await Hospital.findById(req.params.id);

        if(!hospital){
            res.status(400).json({success:false});
        }
        res.status(200).json({success:true,data:hospital});
    }catch(err){
        res.status(400).json({success:true});
    }
    
}

//@desc Create a hospital
//@route POST /api/v1/hospitals
//@access Private
exports.createHospital=async (req,res,next)=>{
    const hospital = await Hospital.create(req.body);
    res.status(201).json({success:true,data:hospital});
}

//@desc Update single hospitals
//@route PUT /api/v1/hospitals/:id
//@access Private
exports.updateHospital=async(req,res,next)=>{
   try{
    const hospital = await Hospital.findByIdAndUpdate(req.params.id, req.body,{
        new:true,
        runValidators:true
    })

    if(!hospital){
        res.status(400).json({success:false});
    }
    res.status(200).json({success:true, data: hospital});
   }catch(err){
    res.status(400).json({success:false});
   }
}

//@desc Delete single hospitals
//@route DELETE /api/v1/hospitals/:id
//@access Private
exports.deleteHospital=async(req,res,next)=>{
    try{
        const hospital = await Hospital.findById(req.params.id);

        if(!hospital){
            res.status(400).json({success:false});
        }
        await hospital.deleteOne();
        res.status(200).json({success:true,data:{}});

    }catch(err){
        res.status(400).json({success:false});
    }
}


