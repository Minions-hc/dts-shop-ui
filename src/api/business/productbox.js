import request from '@/utils/request'

export function listProductBox(query) {
  return request({
    url: '/productBox/getProductBoxByCondition',
    method: 'get',
    params: query
  })
}

export function queryProductsInBox(query) {
  return request({
    url: '/productBox/queryProductsInBox',
    method: 'get',
    params: query
  })
}

export function createProductBox(data) {
  return request({
    url: '/productBox/addProductBox',
    method: 'post',
    data
  })
}

export function updateProductBox(data) {
  return request({
    url: '/productBox/update',
    method: 'post',
    data
  })
}

export function deleteProductBox(data) {
  return request({
    url: '/productBox/delete',
    method: 'post',
    data
  })
}

export function getProductSeries() {
  return request({
    url: '/productSeries/getProductSeries',
    method: 'get'
  })
}
