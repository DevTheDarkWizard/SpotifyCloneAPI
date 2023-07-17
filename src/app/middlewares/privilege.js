module.exports = (req, res, next) => {
	if(!req.userPrivilege || req.userPrivilege < 2) return res.status(403).send();
	return next();
};