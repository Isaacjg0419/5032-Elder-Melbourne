<template>
    <div>
      <h1>Google Map Example</h1>
      <GoogleMap
        api-key="AIzaSyDaEyQ5hYpaWNvWFWMPo-7vYYt3_Fb9iRE"
        mapId="DEMO_MAP_ID"
        style="width: 100%; height: 500px"
        :center="center"
        :zoom="15"
      >
        <AdvancedMarker :options="markerOptions" :pin-options="pinOptions" />
      </GoogleMap>
    </div>
  </template>
  
  <script setup>
  import { GoogleMap, AdvancedMarker } from 'vue3-google-map';
  
  // 设置地图中心和标记选项
  const center = { lat: 40.689247, lng: -74.044502 }; // 以自由女神像为例
  const markerOptions = { position: center, label: 'L', title: 'LADY LIBERTY' };
  const pinOptions = { background: '#FBBC04' }; // 标记的背景颜色
  </script>
  
  <style scoped>
  /* 根据需要调整样式 */
  </style>
  