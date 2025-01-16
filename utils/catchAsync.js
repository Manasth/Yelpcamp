// function catchAsync(fn) {
//     return function (req, res, next) {
//         return fn(req, res, next).then(e => next(e));
//     }
// }

module.exports = func => {
    return (req, res, next) => {
        func(req, res, next).catch(next);
    }
}