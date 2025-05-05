import request from '@/utils/request'

export function getMarketProductList(query) {
  return request({
    url: '/marketProduct/getMarketProductsByCondition',
    method: 'get',
    params: query
  })
}

export function getMarketProductById(query) {
  return request({
    url: '/marketProduct/getMarketProductById',
    method: 'get',
    params: query
  })
}

export function deleteMarketProduct(data) {
  return request({
    url: '/marketProduct/deleteProduct',
    method: 'post',
    data
  })
}

export function addMarketProduct(data) {
  return request({
    url: '/marketProduct/addMarketProduct',
    method: 'post',
    data
  })
}

export function updateMarketProduct(data) {
  return request({
    url: '/marketProduct/updateMarketProduct',
    method: 'post',
    data
  })
}

export function getMarketSeries() {
  return request({
    url: '/marketSeries/getMarketSeries',
    method: 'get'
  })
}

export function getProductLevels() {
  return request({
    url: '/productLevel/getAllProductLevels',
    method: 'get'
  })
}
