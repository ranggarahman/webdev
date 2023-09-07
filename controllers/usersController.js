const User = require('../models/User')
const Note = require('../models/Note')
const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt')

// @desc Get all users
// @route GET /users
// @access Private
const getAllUsers = asyncHandler(async(req, res) => {
    const users = await User.find().select('-password').lean()
    if (!users?.length) {
        return res.status(400).json({
            message: 'No Users Found'
        })
    }

    res.json(users)
})

// @desc create new users
// @route POST /users
// @access Private
const createNewUser = asyncHandler(async(req, res) => {
    const { username, password, roles} = req.body

    //Confirm Data
    if(!username || !password || !Array.isArray(roles) || !roles.length){
        return res.status(400).json({
            message: 'All Fields are Required'
        })
    }

    //Check for Duplicates
    const duplicate = await User.findOne({ username }).lean().exec()

    if (duplicate) {
        return res.status(400).json({
            message : 'Username already taken'
        })
    }

    const hashedPassword = await bcrypt.hash(password, 10) // Salt Rounds
    const userObject = { username, "password": hashedPassword, roles}

    //Store New User
    const user = await User.create(userObject)

    if (user) {
        res.status(201).json({
            message: `New User ${username} created`
        })
    } else {
        res.status(400).json({
            message: 'invalid user data received'
        })
    }
})

// @desc update a user
// @route PATCH /users
// @access Private
const updateUser = asyncHandler(async(req, res) => {
    const { id, username, roles, active, password} = req.body

    if(!id || !username || !Array.isArray(roles) ||
     !roles.length || typeof active !== 'boolean') {
        return res.status(400).json({
            message : 'All fields are required'
        })
     }

     const user = await User.findById(id).exec()

     if(!user) {
        return res.status(400).json({
            message : 'User Not Found'
        })
     }

     const duplicate = await User.findOne({username}).lean().exec()

     //Allow Updates
     if(duplicate && duplicate?.id.toString() !== id){
        return res.status(409).json({
            message: 'Username already taken'
        })
     }

     user.username = username
     user.roles = roles
     user.active = active

     if(password) {
        //Hash Password
        user.password = await bcrypt.hash(password, 10)
     }

     const updatedUser = await user.save()

     res.json({
        message : `${username} updated to ${updateUser.username} successfully`
     })
})

// @desc delete a user
// @route PATCH /users
// @access Private
const deleteUser = asyncHandler(async(req, res) => {
    const {id} = req.body

    if(!id){
        return res.status(400).json({
            message : 'UserID required'
        })
    }

    const notes = await Note.findOne({ user: id }).lean().exec()

    if(notes?.length){
        return res.status(400).json({
            message: 'User has an assigned note.'
        })
    }

    const user = await User.findById(id).exec()

    if(!user) {
        return res.status(400).json({
            message: 'User not found'
        })
    }

    const result = await user.deleteOne()

    const reply = `Username ${result.username} with ID ${result.id} deleted`

    res.json(reply)
})

module.exports = {
    getAllUsers,
    createNewUser,
    updateUser,
    deleteUser
}
