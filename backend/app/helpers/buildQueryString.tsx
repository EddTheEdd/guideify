// buildQueryString.js

export const buildQueryString = (filterParams: any = {}, sortParams: any = {}) => {
    const params = new URLSearchParams();
    for (const key in filterParams) {
      if (filterParams[key]) {
        params.append(key, filterParams[key].join(','));
      }
    }
    if (sortParams.column) {
      params.append('sortColumn', sortParams.column);
      params.append('sortOrder', sortParams.order === 'ascend' ? 'asc' : 'desc');
    }
    return params.toString();
  };
  

  