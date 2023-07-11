
const {response} = require('express');

const usuarioGet = (req,res=response)=>{
    const {q,page= '1',user='No user',limit=1} = req.query;

    res.status(202).json({
        msg:'metodo GET en /usuario controller',
        q,
        page,
        user,
        limit
    })
}

const usuarioPost = (req,res=response)=>{
    const {nombre, cargo } = req.body;
    res.status(201).json({
        desc:'metodo POST en /get',
        nombre,
        cargo
    })
}
const usuarioPut = (req,res=response)=>{
    const {id} = req.params;
    res.json({
        desc:'metodo PUT en /get',
        id
    })
}
const usuarioDelete =(req,res=response)=>{
    res.json({
        desc:'metodo DELETE en /get'
    })
}
const usuarioPatch =(req,res=response)=>{
    res.json({
        desc:'metodo PATCH en /get'
    })
}

module.exports ={
    usuarioGet,
    usuarioPost,
    usuarioPut,
    usuarioDelete,
    usuarioPatch
}