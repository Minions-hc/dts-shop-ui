import request from '@/utils/request'

export function productCategoryList(query) {
  return request({
    url: '/productCategory/getProductCategories',
    method: 'get',
    params: query
  })
}


export function createProductCategory(data) {
  return request({
    url: '/productCategory/addProductCategory',
    method: 'post',
    data
  })
}


export function updateProductCategory(data) {
  return request({
    url: '/productCategory/updateProductCategory',
    method: 'post',
    data
  })
}

export function deleteProductCategory(data) {
  return request({
    url: '/productCategory/deleteProductCategory',
    method: 'post',
    data
  })
}

