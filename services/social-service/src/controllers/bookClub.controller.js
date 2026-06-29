const BookClub = require('../models/bookClub.model');
const Activity = require('../models/activity.model');

exports.createClub = async (req, res) => {
  try {
    const { name, description, coverImage, isPrivate, tags } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Club name is required' });
    }

    const club = await BookClub.create({
      name,
      description: description || '',
      createdBy: req.userId,
      members: [req.userId],
      coverImage: coverImage || '',
      isPrivate: isPrivate || false,
      tags: tags || [],
    });

    await Activity.create({
      userId: req.userId,
      type: 'created_club',
      data: { clubId: club._id.toString(), clubName: club.name }
    });

    res.status(201).json({ club });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getClubs = async (req, res) => {
  try {
    const { search, tag } = req.query;
    const filter = { isPrivate: false };

    if (search) filter.$text = { $search: search };
    if (tag) filter.tags = tag;

    const clubs = await BookClub.find(filter).sort({ createdAt: -1 });
    res.json({ clubs, total: clubs.length });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getClubById = async (req, res) => {
  try {
    const club = await BookClub.findById(req.params.id);
    if (!club) return res.status(404).json({ message: 'Club not found' });
    res.json({ club });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.joinClub = async (req, res) => {
  try {
    const club = await BookClub.findById(req.params.id);
    if (!club) return res.status(404).json({ message: 'Club not found' });

    if (club.members.includes(req.userId)) {
      return res.status(409).json({ message: 'Already a member' });
    }

    club.members.push(req.userId);
    await club.save();

    await Activity.create({
      userId: req.userId,
      type: 'joined_club',
      data: { clubId: club._id.toString(), clubName: club.name }
    });

    res.json({ message: 'Joined club', memberCount: club.members.length });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.leaveClub = async (req, res) => {
  try {
    const club = await BookClub.findById(req.params.id);
    if (!club) return res.status(404).json({ message: 'Club not found' });

    if (club.createdBy === req.userId) {
      return res.status(400).json({ message: 'Club creator cannot leave — transfer ownership first' });
    }

    club.members = club.members.filter(id => id !== req.userId);
    await club.save();

    res.json({ message: 'Left club' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getMyClubs = async (req, res) => {
  try {
    const clubs = await BookClub.find({ members: req.userId })
      .sort({ updatedAt: -1 });
    res.json({ clubs, total: clubs.length });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};