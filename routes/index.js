// 路由全部写在这里
//登录和注册需要的User类
const User = require('../models/user');
//发表需要的Post类
const Post = require('../models/post');
//引入留言需要的Comment类
const Comment = require('../models/comment');
//需要引入一个加密的模块
const crypto = require('crypto');
//引入multer插件热情，
const multer = require('multer');
//插件的配置信息
const storage = multer.diskStorage({
    //这个是上传图片的地址.
    destination:(req, file, cb) =>{
        cb(null, 'public/images')
    },
    //上传到服务器上图片的名字.
    filename:(req, file, cb) =>{
        cb(null, file.originalname)
    }
})
const upload = multer({storage: storage, size: 10225});

//一个权限的问题？
//1.用户未登录的情况下，是无法访问/post ,/logout的
//2.用户在登录的情况下，是无法访问/login,/reg 的
//那么，如果才能完成这个权限的问题呢？

function checkLogin(req, res, next) {
    if (!req.session.user) {
        req.flash('error', '未登录!');
        res.redirect('/login');
    }
    next();
}
//如果登录了，是无法访问登录和注册页面的
function checkNotLogin(req, res, next) {
    if (req.session.user) {
        req.flash('error', '已登录!');
        res.redirect('back');//返回之前的页面
    }
    next();
}

module.exports =  (app) =>{
    //首页
    app.get('/', (req, res)=>{
        const page = parseInt(req.query.p) || 1;
        Post.getTen(null, page, (err, posts, total)=> {
            if (err) {
                posts = [];
            }
            res.render('index', {
                title: '首页',
                user: req.session.user,
                page: page,
                posts: posts,
                isFirstPage: (page - 1) == 0,
                isLastPage: (page - 1) * 10 + posts.length == total,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            })
        })

    })
    //注册页面的路由
    app.get('/reg', checkNotLogin);
    app.get('/reg', (req, res)=>{
        res.render('reg', {
            title: '注册',
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        })
    })
    //注册行为
    app.post('/reg', checkNotLogin);
    app.post('/reg', (req, res)=>{
        //数据接收req.body
        //console.log(req.body);
        //1 收集数据
        //用户名
        var name = req.body.name;
        //密码
        var password = req.body.password;
        //确认密码
        var password_re = req.body['password-repeat'];
        //邮箱
        var email = req.body.email;
        //补充一下，如果未填写的情况下，提示用户
        if (name == '' || password == '' || password_re == '' || email == '') {
            // flash存储一个变量
            req.flash('error', '请正确填写信息');
            return res.redirect('/reg');
        }

        //1.首先检查一下两次密码是否一样
        if (password_re != password) {
            //先保存一下当前的错误信息
            req.flash('error', '用户两次输入的密码不一样');
            return res.redirect('/reg');
        }
        //2.对密码进行加密处理
        var md5 = crypto.createHash('md5');
        var password = md5.update(req.body.password).digest('hex');
        //console.log(password);

        //3.可以开始实例化User对象了 整理到一个对象上去
        var newUser = new User({
            name: name,
            password: password,
            email: email
        });
        //4.检查用户名是否存在
        User.get(newUser.name, (err, user)=>{
            //如果发生了错误,跳转回首页
            if (err) {
                req.flash('error', err);
                return res.redirect('/');
            }
            //如果存在重复的用户名
            if (user) {
                req.flash('error', '用户名已经存在');
                return res.redirect('/reg');
            }
            //正确情况下 把数据存放到数据库里面去
            newUser.save( (err, user)=>{
                if (err) {
                    req.flash('error', err);
                }
                //用户信息存入session
                req.session.user = newUser;
                //console.log(req.session.user);
                req.flash('success', '注册成功');
                res.redirect('/');
            })
        })
    })
    //登录
    app.get('/login', checkNotLogin);
    app.get('/login', (req, res)=>{
        res.render('login', {
            title: '登录',
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        })
    })
    //登录行为
    app.post('/login', checkNotLogin);
    app.post('/login', (req, res)=>{
        //1.检查下用户名有没有
        //2.检查下密码对不对
        //3.存储到session中用户的登录信息
        //4.跳转到首页
        var md5 = crypto.createHash('md5');
        var password = md5.update(req.body.password).digest('hex');
        User.get(req.body.name, (err, user)=>{
            if (!user) {
                //说明用户名不存在
                req.flash('error', '用户名不存在');
                return res.redirect('/login');
            }
            //检查两次密码是否一样
            if (user.password != password) {
                req.flash('error', '密码错误');
                return res.redirect('/login');
            }
            req.session.user = user;
            //console.log(req.session.user);
            req.flash('success', '登录成功');
            res.redirect('/');
        })

    })
    //发表
    app.get('/post', checkLogin);
    app.get('/post', (req, res)=>{
        res.render('post', {
            title: '发表',
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        })
    })
    //发表行为
    app.post('/post', checkLogin);
    app.post('/post', (req, res)=>{
        //当前SESSION里面的用户信息
        const currentUser = req.session.user;
        //判断一下内容不能为空
        if (req.body.title == '' || req.body.post == '') {
            req.flash('error', '内容不能为空');
            return res.redirect('/post');
        }
        //添加一下标签信息
        const tags = [req.body.tag1, req.body.tag2, req.body.tag3];
        const post = new Post(currentUser.name, req.body.title, tags, req.body.post);
        post.save( (err)=>{
            if (err) {
                req.flash('error', err);
                return res.redirect('/');
            }
            req.flash('success', '发布成功');
            res.redirect('/');
        })
    })
    //上传
    app.get('/upload', checkLogin);
    app.get('/upload', (req, res)=>{
        res.render('upload', {
            title: '文件上传',
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        })
    })
    //上传行为
    app.post('/upload', checkLogin);
    app.post('/upload', upload.array('field1', 5), (req, res)=>{
        req.flash('success', '文件保存成功');
        res.redirect('/upload');
    })
    //退出
    app.get('/logout', (req, res)=>{
        //1.清除session
        //2.给用户提示
        //3.跳转到首页
        req.session.user = null;
        req.flash('success', '成功退出');
        res.redirect('/');
    })
    //点击用户名，可以看到用户发布的所有文章
    app.get('/u/:name', (req, res)=>{
        const page = parseInt(req.query.p) || 1;
        //检查用户是否存在
        User.get(req.params.name, (err, user)=>{
            if (!user) {
                req.flash('error', '用户不存在!');
                return res.redirect('/');
            }
            //查询并返回该用户第 page 页的 10 篇文章
            Post.getTen(user.name, page, (err, posts, total)=>{
                if (err) {
                    req.flash('error', err);
                    return res.redirect('/');
                }
                res.render('user', {
                    title: user.name,
                    posts: posts,
                    page: page,
                    isFirstPage: (page - 1) == 0,
                    isLastPage: ((page - 1) * 10 + posts.length) == total,
                    user: req.session.user,
                    success: req.flash('success').toString(),
                    error: req.flash('error').toString()
                });
            });
        });
    });
    //文章详情页面
    app.get('/u/:name/:minute/:title', (req, res)=>{
        Post.getOne(req.params.name, req.params.minute, req.params.title,  (err, post)=>{
            if (err) {
                req.flash('error', '找不到当前文章');
                return res.redirect('/');
            }
            res.render('article', {
                title: req.params.title,
                user: req.session.user,
                post: post,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            })
        })
    })
    //文章的留言发布
    app.post('/comment/:name/:minute/:title', (req, res)=>{
       const date = new Date();
        const time = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +
            date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
        const comment = {
            name: req.body.name,
            time: time,
            content: req.body.content
        }
        const newCommnet = new Comment(req.params.name, req.params.minute, req.params.title, comment);
        newCommnet.save( (err)=>{
            if (err) {
                req.flash('error', err);
                return res.redirect('back');
            }
            req.flash('success', '发布成功');
            res.redirect('back');

        })
    })
    //文章编辑
    app.get('/edit/:name/:minute/:title', checkLogin);
    app.get('/edit/:name/:minute/:title', (req, res)=>{
        //获取到当前的用户
        const currentUser = req.session.user;
        Post.edit(currentUser.name, req.params.minute, req.params.title,(err, post)=>{
            if (err) {
                req.flash('error', err);
                return res.redirect('back');
            }
            res.render('edit', {
                title: '编辑文章',
                user: req.session.user,
                post: post,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            })
        })
    })
    //文章编辑行为
    app.post('/edit/:name/:minute/:title', checkLogin);
    app.post('/edit/:name/:minute/:title', (req, res)=>{
        Post.update(req.params.name, req.params.minute, req.params.title,
            req.body.post, (err)=>{
                //encodeURI是防止有中文的情况下，对中文的字符进行转义
                const url = encodeURI('/u/' + req.params.name + '/' + req.params.minute + '/' + req.params.title);
                if (err) {
                    req.flash('error', err);
                    return res.redirect(url);
                }
                req.flash('success', '编辑成功');
                return res.redirect(url);
            })
    })
    //文章删除行为
    app.get('/remove/:name/:minute/:title', checkLogin);
    app.get('/remove/:name/:minute/:title', (req, res)=>{
        Post.remove(req.params.name, req.params.minute, req.params.title,  (err)=>{
            if (err) {
                req.flash('error', err);
                return res.redirect('back');
            }
            req.flash('success', '修改成功');
            res.redirect('/');
        })
    })
    //文章存档
    app.get('/archive', (req, res)=>{
        Post.getArchive( (err, posts)=>{
            if (err) {
                req.flash('error', err);
                return res.redirect('/');
            }
            res.render('archive', {
                title: '存档',
                posts: posts,
                user: req.session.user,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            })
        })
    })
    //文章标签页
    app.get('/tags', (req, res)=>{
        Post.getTags( (err, posts)=>{
            if (err) {
                req.flash('error', err);
                res.redirect('/');
            }
            res.render('tags', {
                title: '标签',
                posts: posts,
                user: req.session.user,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            })
        })
    })
    //标签对应的文章集合
    app.get('/tags/:tag', (req, res)=>{
        Post.getTag(req.params.tag, (err, posts)=>{
            if (err) {
                req.flash('error', err);
                return res.redirect('/');
            }
            res.render('tag', {
                title: 'TAG:' + req.params.tag,
                user: req.session.user,
                posts: posts,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            })
        })
    })
    //搜索
    app.get('/search', (req, res)=>{
        Post.search(req.query.keyword, (err, posts)=>{
            if (err) {
                req.flash('error', err);
                return res.redirect('/');
            }
            res.render('search', {
                title: 'SEARCH :' + req.query.keyword,
                user: req.session.user,
                posts: posts,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            })
        })
    })
    // 个人简历
    app.get('/resume', (req, res)=>{
        res.render('resume',{
            title: '个人简历'
        })
    })
}


