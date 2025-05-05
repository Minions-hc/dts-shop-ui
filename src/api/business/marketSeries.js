import request from '@/utils/request'

export function getMarketSeriesList(query) {
  return request({
    url: '/marketSeries/getMarketSeries',
    method: 'get',
    params: query
  })
}

export function createMarketSeries(data) {
  return request({
    url: '/marketSeries/addMarketSeries',
    method: 'post',
    data
  })
}

export function updateMarketSeries(data) {
  return request({
    url: '/marketSeries/updateMarketSeries',
    method: 'post',
    data
  })
}

export function deleteMarketSeries(data) {
  return request({
    url: '/marketSeries/deleteMarketSeries',
    method: 'post',
    data
  })
}

