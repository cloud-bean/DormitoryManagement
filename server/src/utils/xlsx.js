const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

/**
 * @param {string} uploadedFilePath 
 * @returns null or json
 */
const readXLSXFiles = uploadedFilePath => {
  let msg = ''
  let data = null
  // check if fiels exist
  if (!fs.existsSync(uploadedFilePath)) {
    msg = 'File does not exist.';
    return {
      msg,
      data
    };
  }


  // 使用path.extname()方法获取文件的后缀名
  const extension = path.extname(uploadedFilePath);
  const support_extensions = ['.csv', '.xlsx', '.xls'];
  if (!support_extensions.includes(extension)) {
    msg = `File type ${extension} is not supported.`;
    return {
      msg,
      data
    };
  }

  // 例如，使用xlsx包读取Excel文件
  if (extension === '.xlsx' || extension === '.xls') {
    const workbook = xlsx.readFile(uploadedFilePath);
    // 选择一个工作表，你可以通过索引选择或者使用工作表的名字
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];

    // 将工作表的内容转换为JSON对象数组
    data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
  }

  // 如果是CSV文件，可以按需读取和解析CSV内容
  if (extension === '.csv') {
    // 读取CSV文件，这里的'filename.csv'是你要读取的文件路径
    const workbook = xlsx.readFile('filename.csv', { type: 'csv' });

    // 获取第一个工作表的内容
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
  }

  return {
    msg: 'success',
    data
  };
}

// test read xls files
const test = () => {
  const fp = path.join(__dirname, '../uploads', 'file-1714659716906.xlsx')
  console.log('fp :>> ', fp);
  const { msg, data } = readXLSXFiles(fp)
  console.log('msg :>> ', msg);
  console.log('data :>> ', data);
}


module.exports = {
  readXLSXFiles
}


