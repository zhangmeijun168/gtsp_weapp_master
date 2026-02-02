const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatTim = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  return [year, month, day].map(formatNumber).join('-')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

module.exports = {
  formatTime: formatTime,
  formatTim: formatTim,
  navigateToPage: (url, paramStr = "") => {
    const currentPages = getCurrentPages();
    const index = currentPages.findIndex(page => page.route === url)
    if (index > -1) {
      wx.navigateBack({
        delta: currentPages.length - index - 1
      })
    } else {
      wx.navigateTo({
        url: '/' + url + '?' + paramStr,
      })
    }
  },
  delay: (time = 2000) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve()
      }, time)
    })
  },
  timeout: (time = 30000) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        reject('请求超时')
      }, time)
    })
  },
  idNoDesensitization: (id) => {
    const fieldDesensitization = (field, before = 3, after = 4) => {
      if (!field) {
        return field;
      }
      field = String(field);
      // 匹配中文、英文、数字
      const regItem = '[\u4e00-\u9fa5a-zA-Z0-9]';
      const regExp = `(${regItem}{${before}})${regItem}*(${regItem}{${after}})`;
      const reg = new RegExp(regExp);

      const markCount = field.length - before - after;
      let mark = '';
      for (let i = 0; i < markCount; i++) {
        mark = mark + '*';
      }
      return field.replace(reg, '$1' + mark + '$2');
    }

    if (!id || id.length <= 1) {
      return id;
    }
    if (id.length < 3) {
      return fieldDesensitization(id, 1, 0);
    } else if (id.length < 6) {
      return fieldDesensitization(id, 1, 1);
    } else if (id.length < 8) {
      return fieldDesensitization(id, 2, 2);
    } else if (id.length < 10) {
      return fieldDesensitization(id, 3, 3);
    } else {
      return fieldDesensitization(id, 4, 4);
    }
  }
}