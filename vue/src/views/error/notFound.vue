<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col items-center justify-center overflow-hidden relative">
    <!-- 背景装饰元素 -->
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute -top-40 -left-40 w-80 h-80 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div class="absolute top-40 -right-40 w-80 h-80 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div class="absolute -bottom-40 left-20 w-80 h-80 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
    </div>

    <div class="relative z-10 text-center px-4 sm:px-6 lg:px-8">
      <!-- 404数字 -->
      <div class="flex justify-center items-center gap-2 sm:gap-4 mb-6">
        <div class="w-20 h-20 sm:w-32 sm:h-32 flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg transform transition-all hover:scale-110 animate-float">
          <span class="text-white text-4xl sm:text-6xl font-bold">4</span>
        </div>
        <div class="w-20 h-20 sm:w-32 sm:h-32 flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg shadow-lg transform transition-all hover:scale-110 animate-float animation-delay-300">
          <span class="text-white text-4xl sm:text-6xl font-bold">0</span>
        </div>
        <div class="w-20 h-20 sm:w-32 sm:h-32 flex items-center justify-center bg-gradient-to-br from-pink-500 to-red-500 rounded-lg shadow-lg transform transition-all hover:scale-110 animate-float animation-delay-600">
          <span class="text-white text-4xl sm:text-6xl font-bold">4</span>
        </div>
      </div>

      <!-- 标题和描述 -->
      <h1 class="text-3xl sm:text-5xl font-bold text-white mb-4 tracking-tight">页面未找到</h1>
      <p class="text-slate-300 text-lg sm:text-xl mb-8 max-w-md mx-auto">
        抱歉，您访问的页面不存在或已被移动。请检查您输入的网址是否正确。
      </p>

      <!-- 回家按钮 -->
      <button 
        @click="$router.push('/')"
        class="group relative inline-flex items-center justify-center px-6 py-3 overflow-hidden font-medium bg-white rounded-lg shadow-lg"
      >
        <span class="relative z-10 text-slate-900 transition-all duration-300 group-hover:text-white">
          返回首页
          <i class="fa fa-home ml-2 group-hover:translate-x-1 transition-transform"></i>
        </span>
        <span class="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></span>
      </button>

      <!-- 装饰性元素 -->
      <div class="mt-12 relative">
        <div class="absolute -left-6 top-0 w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
        <div class="absolute -right-6 top-0 w-3 h-3 bg-purple-400 rounded-full animate-pulse animation-delay-700"></div>
        <p class="text-slate-400 text-sm">
          错误代码: 404 | 最后检查: {{ new Date().toLocaleString() }}
        </p>
      </div>
    </div>

    <!-- 漂浮的小元素 -->
    <div class="absolute bottom-10 left-1/4 w-4 h-4 bg-blue-400 rounded-full opacity-70 animate-float-slow"></div>
    <div class="absolute top-1/3 right-1/4 w-3 h-3 bg-purple-400 rounded-full opacity-70 animate-float-slow animation-delay-1000"></div>
    <div class="absolute bottom-1/4 right-1/3 w-5 h-5 bg-pink-400 rounded-full opacity-70 animate-float-slow animation-delay-2000"></div>
  </div>
</template>

<script lang="ts" setup>
// 可以在这里添加额外的逻辑，比如记录错误日志等
</script>

<style scoped>
/* 动画定义 */
@keyframes blob {
  0% { transform: translate(0px, 0px) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
  100% { transform: translate(0px, 0px) scale(1); }
}

@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
}

@keyframes float-slow {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
  100% { transform: translateY(0px); }
}

.animate-blob {
  animation: blob 7s infinite;
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

.animate-float-slow {
  animation: float-slow 6s ease-in-out infinite;
}

/* 动画延迟类 */
.animation-delay-300 {
  animation-delay: 300ms;
}

.animation-delay-600 {
  animation-delay: 600ms;
}

.animation-delay-700 {
  animation-delay: 700ms;
}

.animation-delay-1000 {
  animation-delay: 1000ms;
}

.animation-delay-2000 {
  animation-delay: 2000ms;
}

.animation-delay-4000 {
  animation-delay: 4000ms;
}
</style>