<script setup>
const handleSubmit = () => {
  alert("Login form submitted")
}
</script>
<template>
  <form @submit.prevent="handleSubmit">
    <input type="email" placeholder="Email" />
    <input type="password" placeholder="Password" />
    <button type="submit">Login</button>
  </form>
</template>
<style></style>
