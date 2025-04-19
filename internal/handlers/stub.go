package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func Stub(ctx *gin.Context) {
	ctx.JSON(http.StatusNotImplemented, gin.H{"message": "Need to implement!"})
}
