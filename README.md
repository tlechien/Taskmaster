# taskmaster
# Fichier de configuration
- La commande à utiliser pour lancer le programme
- Le nombre de processus à lancer et laisser tourner
- Choisir de lancer ce programme au démarrage ou non
- Choisir si le programme doit toujours être relancé, jamais, ou uniquement lorsqu’il
s’arrête de manière innatendue
- Quel code de retour represente une sortie "attendue" du programme
- Combien de temps le programme doit-il tourner après son démarrage pour que
l’on considère qu’il s’est "lancé correctement"
- Combien de fois un redémarrage doit être réalisé avant de s’arrêter
- Quel signal doit être utilisé pour arrêter (i.e. exit gracefully) le programme
- Combien de temps d’attente après un graceful stop avant de kill le programme
- Options pour retirer les stdout/stderr du programme ou pour rediriger vers des
fichiers
- Des variables d’environnement a set avant de lancer le programme
- Un répertoire de travail a set avant de lancer le programme
- Un umask a set avant de lancer le programme