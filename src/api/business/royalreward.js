import request from '@/utils/request'

export function listRulers(query) {
  return request({
    url: '/rewardrules/list',
    method: 'get',
    params: query
  })
}

export function deleteRuler(data) {
  return request({
    url: '/rewardrules/delete',
    method: 'post',
    data
  })
}

export function createRuler(data) {
  return request({
    url: '/rewardrules/create',
    method: 'post',
    data
  })
}

export function updateRuler(data) {
  return request({
    url: '/rewardrules/update',
    method: 'post',
    data
  })
}

