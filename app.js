const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const morgan = require('morgan');
const session = require('express-session');
const nunjucks= require('nunjucks');
const dotenv= require('dotenv');

const authRouter = require('./routes/auth');
const indexRouter = require('./routes');
const {sequelize} = require('./models');
const passportConfig = require('./passport');

dotenv.config();
const app = express();
passportConfig();

// 포트 번호 5050 으로 설정
app.set('port',process.env.PORT || 5050);

// 무슨 엔진으로 작동 시킬지
app.set('view engine', 'html');
nunjucks.configure('views',{
   express:app,
   watch:true, 
});
 // 싱크 맞추어져 잇는지 확인
sequelize.sync({force : false})
    .then(() => {
        console.log('데이터 베이스 연결 성공 계속하자!');
    })
    .errorㅇㅎ((err) => {
        console.error(err);
        console.error("에러발생 한번 확인해보세요!\n");
    });


app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(session({
        resave:true,
        saveUninitialized:false,
        secret:process.env.COOKIE_SECRET,
        
            // cookie 부분 일부분 수정 및 추가
        cookie:{
            httpOnly : true,
            secure : false,
            encode:true,
            
        },
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/auth',authRouter);
app.use('/',indexRouter);

app.use((req,res,next)=> {
    const error = new Error(`${req.method} ${req.url} 라우터가 존재하지 않습니다.`);
    error.status = 404;
    next(error);
});

app.use((err,req,res,next) => {
    res.locals.message = err.message;
    res.locals.error = process.NODE_ENV !== 'production' ? err : {};
    res.status(err.status || 500);
    res.render('오류 500 발생!');

});
app.listen(app.get('port'),() => {
    console.log(add.get('port'), '한조 대기중이 아닌 포트 대기중');
});

// https://bcho.tistory.com/887 이 블로그 보고 한번 공부해보자