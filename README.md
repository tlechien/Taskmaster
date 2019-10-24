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
# Commandes du shell
- help
	- liste les differentes commandes
- status
	- afficher status des pids de tous les programmes.
- run [program]
	- lancer un program
- stop [program
	- arreter un program
- kill [program] SIGNAL]
	- envoyer un SIGNAL a program
- restart [program]
	- redemarrer un program
- fetch
	- fetch les nouveaux fichiers de configuration
- update
	- recharger les fichiers de configuration
- create
	- creer un fichier de configuration
- clear process process2
	- supprimer les fichiers de log de process et process2
- clearall
	- supprimer tous les fichiers log
- startserver
	- demarrer le serveur
- tail [program] [out]
	- affiche la sortie fd dans la console de program
- debug
	- affiche le log de Taskmaster.
- quit
	- quitter taskmaster
- exit
	- fermer le shell
#Idées
- au lancement du programme, afficher tous les logs sur le chargement des fichiers de configuration et envoyer le status de tous les programmes executés avant d'envoyer le prompt
- mettre des logs colorisé a chaque interaction pour plus dinformation
