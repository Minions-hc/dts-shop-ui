import request from '@/utils/request'

export function listRedemptionCode(query) {
  return request({
    url: '/redemptionCode/list',
    method: 'get',
    params: query
  })
}

export function createRedemptionCode(data) {
  return request({
    url: '/redemptionCode/create',
    method: 'post',
    data
  })
}

export function deleteRedemptionCode(param) {
  return request({
    url: '/redemptionCode/delete/' + param,
    method: 'post'
  })
}
