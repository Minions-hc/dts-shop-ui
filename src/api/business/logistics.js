import request from '@/utils/request'

export function listLogistics(query) {
  return request({
    url: '/logistics/listLogistics',
    method: 'get',
    params: query
  })
}

export function createLogistics(data) {
  return request({
    url: '/logistics/createLogistics',
    method: 'post',
    data
  })
}

export function updateLogistics(data) {
  return request({
    url: '/logistics/updateLogistics',
    method: 'post',
    data
  })
}

export function deleteLogistics(data) {
  return request({
    url: '/logistics/deleteLogistics',
    method: 'post',
    data
  })
}
