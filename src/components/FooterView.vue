<template>
    <v-bottom-navigation :elevation="0">
        <v-row justify="center" rowa="auto">
            <v-col cols="auto">
                <v-btn to="/" icon>
                    <v-icon>mdi-login</v-icon>
                </v-btn>
            </v-col>
            <v-col cols="auto">
                <v-btn to="/home" icon>
                    <v-icon>mdi-home</v-icon>
                </v-btn>
            </v-col>
            <v-col cols="auto">
                <v-btn to="/profile" icon>
                    <v-icon>mdi-face-profile</v-icon>
                </v-btn>
            </v-col>
        </v-row>
    </v-bottom-navigation>
</template>