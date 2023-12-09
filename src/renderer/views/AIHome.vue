<template>
  <div class="home">
    <h1>Welcome to Sportshall Scorer</h1>
    <div class="links">
      <router-link to="/add-user" class="link">Add User</router-link>
      <router-link to="/add-event" class="link">Add Event</router-link>
      <router-link to="/add-venue" class="link">Add Venue</router-link>
      <router-link to="/sign-up" class="link">Sign Up for Event</router-link>
      <router-link to="/enter-results" class="link">Enter Results</router-link>
      <router-link to="/view-results" class="link">View Results</router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AIHome',
}
</script>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
}

.links {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 20px;
}

.link {
  margin: 10px;
  padding: 10px 20px;
  background-color: #007bff;
  color: #fff;
  text-decoration: none;
  border-radius: 5px;
}

.link:hover {
  background-color: #0056b3;
}
</style>
