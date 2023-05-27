module.exports = {
    client: {
        token: '',
    },

    mongoose: {
        uri: '',
    },

    channels: {
        registerChannelId: '',
    },

    roles: {
        // If no role operation is required, do not enter any value and leave it as "[]".
        assignedRole: ['role_id'],
        retrievedRole: [],
    },

    options: {
        embedColor: '#2b2d31',
        mailTitle: 'Your Server Name',
        mailSubject: 'Verifaction System',
    },

    google: {
        // It is mandatory for the account sending the email to be a Google account.
        mail: 'example@gmail.com',
        password: 'your_app_password',
        /* Important!
        
            The password requested from you is 'App Passwords,' not the password you use to sign in to your account.

            Go to your Google account settings and enable 2-Step Verification if it's not already enabled. 
            Then, type 'App Passwords' in the search box and navigate to the relevant section. 
            Next, select the 'Other' option from the 'Select app' section and choose a name for it (it doesn't matter what name you choose). 
            Afterwards, a password will be generated for you. Yes, that's the password we need!"

        */
    },

    // tr & en
    lang: 'en',
};
