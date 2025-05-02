import request from '@/utils/request'

export function listLuckyDraw(query) {
  return request({
    url: '/luckydraw/activity/list',
    method: 'get',
    params: query
  })
}

export function deleteLuckyDraw(data) {
  return request({
    url: '/luckydraw/activity/delete',
    method: 'post',
    data
  })
}

export function createLuckyDraw(data) {
  return request({
    url: '/luckydraw/activity/create',
    method: 'post',
    data
  })
}

export function updateLuckyDraw(data) {
  return request({
    url: '/luckydraw/activity/update',
    method: 'post',
    data
  })
}

export function getActivityDetails(query) {
  return request({
    url: '/luckydraw/activity/detail',
    method: 'get',
    params: query
  })
}

