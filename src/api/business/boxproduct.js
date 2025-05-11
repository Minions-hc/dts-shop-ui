import request from '@/utils/request'
import Qs from 'qs'

export function listBoxProduct(query) {
  return request({
    url: '/box/products',
    method: 'get',
    params: query,
    paramsSerializer: function(params) {
      return Qs.stringify(params, { arrayFormat: 'repeat' })
    }
  })
}
