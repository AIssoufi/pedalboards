module.exports = {
    "env": {
        "browser": true,
        "es6": true
    },
    "extends": ["react-app", "airbnb", "plugin:jsx-a11y/recommended"],
    "globals": {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly"
    },
    "parserOptions": {
        "ecmaFeatures": {
            "jsx": true
        },
        "ecmaVersion": 2018,
        "sourceType": "module"
    },
    "plugins": [
        "react"
    ],
    "rules": {
        "indent": [
            2,
            2
        ],
        "comma-dangle": [
            "error",
            "never"
        ]
    },
    "settings": {
        "import/resolver": {
            "node": {
                "moduleDirectory": [
                    "node_modules",
                    "src"
                ]
            }
        }
    }
};