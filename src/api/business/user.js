import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/user/queryUserList',
    method: 'get',
    params: query
  })
}

export function approveAgency(data) {
  return request({
    url: '/user/approveAgency',
    method: 'post',
    data
  })
}

export function detailApprove(id) {
  return request({
    url: '/user/detailApprove',
    method: 'get',
    params: { id }
  })
}

export function listAddress(query) {
  return request({
    url: '/address/queryAddressList',
    method: 'get',
    params: query
  })
}

export function listCollect(query) {
  return request({
    url: '/collect/list',
    method: 'get',
    params: query
  })
}

export function listFeedback(query) {
  return request({
    url: '/feedback/list',
    method: 'get',
    params: query
  })
}

export function listFootprint(query) {
  return request({
    url: '/footprint/list',
    method: 'get',
    params: query
  })
}

export function listHistory(query) {
  return request({
    url: '/history/list',
    method: 'get',
    params: query
  })
}

