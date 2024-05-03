// ====   require here   ====
// 配置
const { sysConfig } = require("./config")
// package
const path = require("path")
const Koa = require("koa")
const Router = require("koa-router")
const KoaBody = require("koa-body")
const koaJwt = require("koa-jwt")
const cors = require("@koa/cors")
const koaStatic = require("koa-static")
const KoaLoger = require("koa-logger")
const multer = require('@koa/multer');
const fs = require('fs');

// 定义文件存储路径
const uploadDir = path.join(__dirname, 'uploads');
// 确保存储路径存在
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (ctx, file, cb) => {
    cb(null, uploadDir); // 指定上传文件的保存路径
  },
  filename: (ctx, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// 初始化multer中间件
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * (1024 * 1024) // 限制 10 MB
  }
});


// 自定义中间件
const errorHandle = require("./middle/error_handler")
const tokenChecker = require("./middle/token_checker")
// 其他
const dbGenerator = require("./db/db_generator")
// ==== code from here ====

// 实例化
const app = new Koa()
const router = new Router()

// 建立数据库连接
dbGenerator()

// log
app.use(KoaLoger())

// 处理跨域
app.use(cors())

// 错误处理
app.use(errorHandle())

// 处理静态资源
const staticPath = "../static"
app.use(koaStatic(path.join(__dirname, staticPath)))



// jwt 处理
app.use(
  koaJwt({ secret: sysConfig.tokenSalt }).unless({
    path: [
      /^\/api\/test/,
      /^\/api\/user\/login/,
      /^\/api\/user\/register/,
      /^\/api\/upload/,
      /^((?!\/api).)*$/ // 设置除了私有接口外的其它资源，可以不需要认证访问
    ]
  })
)

app.use(tokenChecker())

// 创建路由
router.post("/api/upload", upload.single('file'), async (ctx) => {
  // 'file'是前端表单中文件输入字段的名称
  console.log('enter api upload :>> ', ctx.file);
  const file = ctx.file;
  if (file) {
    ctx.status = 200;
    ctx.body = {
      message: 'File uploaded successfully!',
      filename: file.filename
    };
  } else {
    ctx.status = 400;
    ctx.body = { error: 'No file uploaded.' };
  }
});

// 解析 Body
const koa_body_mw = KoaBody({
  multipart: true,
  formidable: {
    uploadDir: uploadDir,
    keepExtensions: true,
    maxFieldsSize: 2000 * 1024 * 1024
  }
})

router.use("/api/user", koa_body_mw, require("./routes/user_router"))
router.use("/api/building", koa_body_mw, require("./routes/building_router"))
router.use("/api/floor", koa_body_mw, require("./routes/floor_router"))
router.use("/api/room", koa_body_mw, require("./routes/room_router"))
router.use("/api/evaluate", koa_body_mw, require("./routes/evaluate_router"))
router.use("/api/record", koa_body_mw, require("./routes/record_router"))
router.use("/api/cleaner", koa_body_mw, require("./routes/cleaner_router"))
router.use("/api/faculty", koa_body_mw, require("./routes/faculty_router"))
router.use("/api/visitor", koa_body_mw, require("./routes/visitor_router"))

app.use(router.routes())

app.listen(sysConfig.port)
console.log(`serve running on: http://localhost:${sysConfig.port}`)
