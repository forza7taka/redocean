<template>
  <v-container class="my-5">
    <v-row justify="center">
      <v-col cols="12" md="8">
        <v-card class="elevation-2">
          <v-card-title class="headline mb-0">Description</v-card-title>
          <v-divider class="mt-3"></v-divider>
          <v-card-text>
            <p class="mb-3">redocean is a web client for the social media platform <a
                href="https://blueskyweb.xyz/">Bluesky</a>.</p>

            <p class="mb-3">It uses Google OAuth to create user accounts (separate from Bluesky accounts) and stores
              redocean's user
              settings information.
            </p>
            <p class="mb-3">By clicking the Sync button, users can navigate to the Sync screen and create an account using
              the "Sign
              in with Google" button.
            </p>
            <p class="mb-3">The backend system utilizes <a href="https://parseplatform.org/">Parse-Server</a> and creates
              user accounts
              using the id_token, access_token, and emailAddresses[0].metadata.source.id obtained through Google OAuth.
            </p>

            <p class="mb-3">The Google OAuth uses the project ID <strong>redocean-385711</strong>.</p>


          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
  