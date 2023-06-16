const Card = require('../models/Card');
const { STATUS_CODES } = require('../utils/constants');
const NotFoundError = require('../utils/errors/NotFoundError');
const BadRequestError = require('../utils/errors/BadRequestError');
const ForbiddenError = require('../utils/errors/ForbiddenError');

const getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => res.status(STATUS_CODES.OK).send({ cards }))
    .catch(next);
};

const createCard = (req, res, next) => {
  const { name, link } = req.body;
  return Card.create({ name, link, owner: req.user._id })
    .then((card) => res.status(STATUS_CODES.CREATED).send({ card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new BadRequestError('Incorrect data entered when creating card'));
      }
      return next(err);
    });
};

const deleteCard = (req, res, next) => {
  Card.findById(req.params.cardId)
    .then((card) => {
      if (!card) {
        throw new NotFoundError('Card not found');
      }
      // проверяем, является ли текущий пользователь владельцем карточки
      if (card.owner.toString() !== req.user._id) {
        throw new ForbiddenError('You do not have permission to delete this card');
      }
      card.deleteOne()
        .then(() => res.send({ message: 'Card deleted successfully' }))
        .catch(next);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new BadRequestError('Incorrect search data entered'));
      }
      return next(err);
    });
};

const updateCardLikes = ({ action, errorMessage }) => (req, res, next) => {
  const update = { [action]: { likes: req.user._id } };

  Card.findByIdAndUpdate(
    req.params.cardId,
    update,
    { new: true },
  )
    .then((card) => {
      if (!card) {
        throw new NotFoundError('Card not found');
      }
      res.status(STATUS_CODES.OK).send({ data: card });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new BadRequestError(errorMessage));
      }
      return next(err);
    });
};

const likeCard = updateCardLikes({
  action: '$addToSet',
  errorMessage: 'Incorrect search data entered when liking card',
});
const dislikeCard = updateCardLikes({
  action: '$pull',
  errorMessage: 'Incorrect search data entered when disliking card',
});

module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
};
