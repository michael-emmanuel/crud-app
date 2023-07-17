const express = require("express")
const router = express.Router()
const Subscriber = require("../models/subscriber")

// Use try catch with async await when performing DB actions. SEE BELOW...
// making is async bc we are using a try catch
// if an async function error in a synchronous try/catch block, no error throws

// Getting All
router.get("/", async (req, res) => {
  try {
    const subscribers = await Subscriber.find()
    res.json(subscribers)
  } catch (err) {
    // failed on the server side
    res.status(500).json({ message: err.message })
  }
})

// Getting One
router.get("/:id", getSubscriber, (req, res) => {
  res.json(res.subscriber)
})

// Creating One
router.post("/", async (req, res) => {
  const subscriber = new Subscriber({
    name: req.body.name,
    subscribedToChannel: req.body.subscribedToChannel,
  })

  try {
    const newSubscriber = await subscriber.save()
    // status 201 is a more specific way to save successfully created an obj
    // alway send 201 instead of 200 on post route
    // otherwise by default it will send a status of 200
    res.status(201).json(newSubscriber)
  } catch (err) {
    // fail bc user gave bad data
    res.status(400).json({ message: err.message })
  }
})

// Updating One
router.patch("/:id", getSubscriber, async (req, res) => {
  if (req.body.name != null) {
    res.subscriber.name = req.body.name
  }
  if (req.body.subscribedToChannel != null) {
    res.subscriber.subscribedToChannel = req.body.subscribedToChannel
  }

  try {
    const updatedSubscriber = await res.subscriber.save()
    res.json(updatedSubscriber)
  } catch (err) {
    // fail bc user gave bad data
    res.status(400).json({ message: err.message })
  }
})

// Deleting One
router.delete("/:id", getSubscriber, async (req, res) => {
  try {
    await res.subscriber.remove()
    res.json({ message: "Deleted Subscriber" })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// This function is middleware
async function getSubscriber(req, res, next) {
  let subscriber
  try {
    // req.params.id correlates to /:id in arg calling this function
    subscriber = await Subscriber.findById(req.params.id)
    if (subscriber == null) {
      return res.status(404).json({ message: "Cannot find subscriber" })
    }
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }

  res.subscriber = subscriber
  // once we successfully gone through the function
  // next() lets us get to the next piece of middleware
  // or the actual request itself
  next()
}

module.exports = router
