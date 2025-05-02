import request from '@/utils/request'

export function getQrcodeList() {
  return request({
    url: '/wx/qrcode/list',
    method: 'get'
  })
}

export function deleteQrcode(data) {
  return request({
    url: '/wx/qrcode/delete',
    method: 'post',
    data
  })
}

export function createQrcode(data) {
  return request({
    url: '/wx/qrcode/create',
    method: 'post',
    data
  })
}

export function updateQrcode(data) {
  return request({
    url: '/wx/qrcode/update',
    method: 'post',
    data
  })
}
