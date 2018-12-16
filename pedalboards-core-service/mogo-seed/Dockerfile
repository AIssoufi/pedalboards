FROM mongo
COPY init.json /init.json
CMD mongoimport --host mongodb --db mbds --collection pedalboards --type json --file /init.json --jsonArray