import request from '@/utils/request'

export function listLuckyDrawPrize(query) {
  return request({
    url: '/luckydraw/prize/getPrizesByCondition',
    method: 'get',
    params: query
  })
}

export function deleteLuckyDrawPrize(data) {
  return request({
    url: '/luckydraw/prize/delete',
    method: 'post',
    data
  })
}

export function createLuckyDrawPrize(data) {
  return request({
    url: '/luckydraw/prize/create',
    method: 'post',
    data
  })
}

export function updateLuckyDrawPrize(data) {
  return request({
    url: '/luckydraw/prize/update',
    method: 'post',
    data
  })
}

export function getPrizeDetails(query) {
  return request({
    url: '/luckydraw/prize/detail',
    method: 'get',
    params: query
  })
}

