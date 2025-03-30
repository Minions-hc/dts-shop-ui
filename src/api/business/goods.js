import request from '@/utils/request'

export function getProductList(query) {
  console.log(query);
  return request({
    url: '/product/getProductsByCondition',
    method: 'get',
    params: query
  })
}

export function getProductById(query) {
  console.log(query);
  return request({
    url: '/product/getProductById',
    method: 'get',
    params: query
  })
}

export function deleteProduct(data) {
  return request({
    url: '/product/deleteProduct',
    method: 'post',
    data
  })
}

export function addProduct(data) {
  return request({
    url: '/product/addProduct',
    method: 'post',
    data
  })
}



export function updateProduct(data) {
  return request({
    url: '/product/updateProduct',
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


export function getProductLevels() {
  return request({
    url: '/productLevel/getAllProductLevels',
    method: 'get'
  })
}
