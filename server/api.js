// 可能是我的node版本问题，不用严格模式使用ES6语法会报错
"use strict";
const models = require('./db');
const express = require('express');
const router = express.Router();
const expressJwt = require("express-jwt");
const jwt = require("jsonwebtoken");

router.use(expressJwt({secret: "secret"}).unless({path: ["/api/login"]}));
router.use(function (err, req, res, next) {
  if (err.name === "UnauthorizedError") {
    res.status(401).send("invalid token");
  }
});
/************** 创建(create) 读取(get) 更新(update) 删除(delete) **************/

router.post("/api/login", function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  if (!username) {
    return res.status(400).send("username require");
  }
  if (!password) {
    return res.status(400).send("password require");
  }

  if (username != "admin" && password != "password") {
    return res.status(401).send("invaild password");
  }

  var authToken = jwt.sign({username: username}, "secret");
  res.status(200).json({token: authToken});

});

// 获取已有博客账号接口
router.get('/api/users',(req,res) => {
    // 通过模型去查找数据库
    models.User.find((err,data) => {
        if (err) {
            res.send(err);
        } else {
            res.send(data);
        }
    });
});

router.post('/api/users',(req,res) => {
    // 通过模型去查找数据库
    var user = new models.User({
    	title:req.body.title,
    	website:req.body.website
    });
    user.save((err,data) => {
    	if (err) {
    		res.send(err);
    	} else {
    		res.send(data);
    	}
    });
});

router.put('/api/users/:id',(req,res) => {
	return models.User.findById(req.params.id,(err,user) => {
		if(!user){
			res.statusCode = 404;
			return res.send({ error: "未找到该博客"});
		}
		user.title = req.body.title;
		user.website = req.body.website;
		return user.save((err,data) => {
			if (!err) {
                return res.send({ status: 'OK', user:user });
            } else {
                if(err.name == 'ValidationError') {
                    res.statusCode = 400;
                    res.send({ error: 'Validation error' });
                } else {
                    res.statusCode = 500;
                    res.send({ error: '服务器异常' });
                }
            }
		})
	})
})

router.delete('/api/users/:id',(req,res) => {
	return models.User.findById(req.params.id,(err,user) => {
		if(!user){
			res.statusCode = 404;
			return res.send({error: "未找到该博客"});
		}
		return user.remove((err) => {
			if(!err){
				return res.send({ status: "删除成功"})
			} else {
				res.statusCode = 500;
				return res.send({ error: "服务器异常"})
			}
		})
	})
})

module.exports = router;