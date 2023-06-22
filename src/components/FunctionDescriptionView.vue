<template>
  <v-container class="my-5">
    <v-row justify="center">
      <v-col cols="12" md="8">
        <v-card class="elevation-2">
          <v-card-title class="headline mb-0">Description</v-card-title>
          <v-divider class="mt-3"></v-divider>
          <v-card-text>
            <p>redocean is a web client for the social media platform "Bluesky".</p>

            <p>It uses Google OAuth to create user accounts (separate from Bluesky accounts) and stores redocean's user
              settings information.</p>
            <ul>
              <li>By clicking the Sync button, users can navigate to the Sync screen and create an account using the "Sign
                in with Google" button.</li>
            </ul>

            <p>The backend system utilizes <a href="https://parseplatform.org/">Parse-Server</a> and creates user accounts
              using the id_token, access_token, and emailAddresses[0].metadata.source.id obtained through Google OAuth.
            </p>

            <p>The Google OAuth uses the project ID <strong>redocean-385711</strong>.</p>


          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
  