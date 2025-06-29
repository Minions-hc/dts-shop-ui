import request from '@/utils/request'

export function productSeriesList(query) {
  return request({
    url: '/productSeries/getProductSeries',
    method: 'get',
    params: query
  })
}

export function createProductSeries(data) {
  return request({
    url: '/productSeries/addProductSeries',
    method: 'post',
    data
  })
}

export function updateProductSeries(data) {
  return request({
    url: '/productSeries/updateProductSeries',
    method: 'post',
    data
  })
}

export function deleteProductSeries(data) {
  return request({
    url: '/productSeries/deleteProductSeries',
    method: 'post',
    data
  })
}

// 更新产品系列状态
export function updateProductSeriesOnSaleStatus(data) {
  return request({
    url: '/productSeries/updateStatus',
    method: 'post',
    data
  })
}

